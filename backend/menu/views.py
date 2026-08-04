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

    system_prompt = f"""You are an expert restaurant assistant for SpiceRoute restaurant. \
Your job is to help customers find the best dishes based on their needs.

FULL MENU (use ONLY these items):
{menu_text}

STRICT RULES:
1. Answer accurately based on the menu data above — prices, calories, veg/non-veg, spicy/mild must be correct.
2. If the user asks about diet/calories, filter and list only items that match their criteria with exact calorie counts.
3. If the user asks about price, give exact prices from the menu.
4. Keep replies concise but complete — list the matching items clearly.
5. NEVER suggest or mention items not in the menu above.
6. At the very end of every reply, on a new line write exactly:
   SUGGEST: item1, item2, item3
   (comma-separated names of recommended items from the menu, or SUGGEST: none if nothing fits)
7. Do not include "SUGGEST:" in the visible reply text — only at the end as a separate line."""

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
        max_tokens=500,
        temperature=0.3,    # lower = more factual, less hallucination
    )

    reply = completion.choices[0].message.content.strip()

    # Parse SUGGEST line
    suggested  = []
    reply_txt  = reply
    if 'SUGGEST:' in reply:
        parts     = reply.split('SUGGEST:')
        reply_txt = parts[0].strip()
        raw       = parts[-1].strip().split('\n')[0]  # only first line after SUGGEST:
        if raw.lower() != 'none':
            suggested = [s.strip() for s in raw.split(',') if s.strip()]

    return Response({'reply': reply_txt, 'suggested': suggested})
