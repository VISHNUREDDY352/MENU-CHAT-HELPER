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
    if not user_message:
        return Response({'error': 'message is required'}, status=400)

    # Build a compact menu summary for the AI
    items = MenuItem.objects.all()
    menu_text = '\n'.join(
        f"- {i.name} | {i.category} | ₹{i.price} | "
        f"{'veg' if i.is_veg else 'non-veg'} | "
        f"{'spicy' if i.is_spicy else 'mild'} | "
        f"{i.calories if i.calories else 'N/A'} kcal"
        for i in items
    )

    system_prompt = f"""You are a helpful restaurant assistant.
Menu:
{menu_text}

Rules:
1. Reply in ONE short sentence.
2. At the end of your reply, on a new line write: SUGGEST: item1, item2
   (only items from the menu above, comma-separated, no extra text)
3. If nothing matches, write SUGGEST: none"""

    client = Groq(api_key=os.environ.get('GROQ_API_KEY') or getattr(settings, 'GROQ_API_KEY', ''))
    completion = client.chat.completions.create(
        model='llama-3.1-8b-instant',
        messages=[
            {'role': 'system', 'content': system_prompt},
            {'role': 'user',   'content': user_message},
        ],
        max_tokens=200,
    )

    reply = completion.choices[0].message.content.strip()

    # Parse SUGGEST line
    suggested = []
    if 'SUGGEST:' in reply:
        parts     = reply.split('SUGGEST:')
        reply_txt = parts[0].strip()
        raw       = parts[1].strip()
        if raw.lower() != 'none':
            suggested = [s.strip() for s in raw.split(',')]
    else:
        reply_txt = reply

    return Response({'reply': reply_txt, 'suggested': suggested})
