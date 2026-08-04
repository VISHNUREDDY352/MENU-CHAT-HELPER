import os
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from groq import Groq
from .models import MenuItem
from .serializers import MenuItemSerializer


@api_view(['GET'])
def menu_list(request):
    items = MenuItem.objects.all()
    return Response(MenuItemSerializer(items, many=True).data)


@api_view(['POST'])
def chat(request):
    user_message = request.data.get('message', '')
    history      = request.data.get('history', [])   # [{role, text}, ...]

    if not user_message:
        return Response({'error': 'message is required'}, status=400)

    # Build detailed menu reference for the AI
    items = MenuItem.objects.all()
    menu_lines = []
    for i in items:
        line = (
            f"- {i.name} | category: {i.category} | price: ₹{i.price} | "
            f"{'vegetarian' if i.is_veg else 'non-vegetarian'} | "
            f"{'spicy' if i.is_spicy else 'mild'} | "
            f"{i.calories} kcal"
        )
        if i.description:
            line += f" | {i.description}"
        menu_lines.append(line)
    menu_text = '\n'.join(menu_lines)

    system_prompt = f"""You are an expert restaurant assistant for SpiceRoute restaurant.
Your job is to help customers find the right dishes based on their needs.

FULL MENU (use ONLY these items — never invent items):
{menu_text}

STRICT RULES:
1. When the user asks for recommendations (spicy, veg, low calorie, cheap, etc.), list EVERY item from the menu that matches — do not limit to just 2 or 3.
2. For each matching item, show: name, price, calories, and veg/non-veg status.
3. Be accurate — prices, calories, veg/non-veg, spicy/mild must exactly match the menu data above.
4. Never mention items not in the menu above.
5. Format matching items as a clear list.
6. At the very end of your reply, on a new line write exactly:
   SUGGEST: item1, item2, item3, ...
   List ALL matching item names comma-separated. Write SUGGEST: none only if truly nothing matches.
7. Do not include the word "SUGGEST:" anywhere in your visible reply text — only as the final line."""

    client = Groq(
        api_key=os.environ.get('GROQ_API_KEY') or getattr(settings, 'GROQ_API_KEY', '')
    )

    # Build message list including conversation history for context
    messages = [{'role': 'system', 'content': system_prompt}]
    for h in history[-6:]:   # keep last 6 turns to stay within token limits
        role = 'user' if h.get('role') == 'user' else 'assistant'
        messages.append({'role': role, 'content': h.get('text', '')})
    messages.append({'role': 'user', 'content': user_message})

    completion = client.chat.completions.create(
        model='llama-3.3-70b-versatile',   # more capable model for accuracy
        messages=messages,
        max_tokens=1000,
        temperature=0.2,    # very factual
    )

    reply = completion.choices[0].message.content.strip()

    # Parse SUGGEST line
    suggested     = []
    suggested_ids = []
    reply_txt     = reply

    if 'SUGGEST:' in reply:
        parts     = reply.split('SUGGEST:')
        reply_txt = parts[0].strip()
        raw       = parts[-1].strip().split('\n')[0]
        if raw.lower() != 'none':
            suggested = [s.strip() for s in raw.split(',') if s.strip()]
            # Resolve names → IDs
            name_to_id = {i.name.lower().strip(): i.id for i in items}
            suggested_ids = [
                name_to_id[n.lower().strip()]
                for n in suggested
                if n.lower().strip() in name_to_id
            ]

    return Response({'reply': reply_txt, 'suggested': suggested, 'suggested_item_ids': suggested_ids})
