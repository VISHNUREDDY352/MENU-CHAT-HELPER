import os
import random
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from groq import Groq
from .models import MenuItem, Customer, Order, OrderItem
from .serializers import MenuItemSerializer

# In-memory OTP store: { phone: otp_string }
# Good enough for hackathon; replace with Redis/DB for production
_otp_store = {}


@api_view(['GET'])
def menu_list(request):
    items = MenuItem.objects.all()
    return Response(MenuItemSerializer(items, many=True).data)


# ── Auth endpoints ──────────────────────────────────────────

@api_view(['POST'])
def send_otp(request):
    """Generate and store OTP for a phone number."""
    phone = request.data.get('phone', '').strip()
    if not phone or not phone.isdigit() or len(phone) != 10:
        return Response({'error': 'Invalid phone number'}, status=400)

    otp = str(random.randint(100000, 999999))
    _otp_store[phone] = otp

    # TODO: Integrate SMS gateway (MSG91 / Twilio) here
    # For demo: return OTP in response so frontend can show it
    return Response({'message': f'OTP sent to +91 {phone}', 'otp': otp})


@api_view(['POST'])
def verify_otp(request):
    """Verify OTP, create/get Customer, return customer data."""
    phone = request.data.get('phone', '').strip()
    otp   = request.data.get('otp', '').strip()

    if not phone or not otp:
        return Response({'error': 'phone and otp are required'}, status=400)

    stored = _otp_store.get(phone)
    if not stored or stored != otp:
        return Response({'error': 'Invalid or expired OTP'}, status=400)

    # OTP verified — remove from store
    del _otp_store[phone]

    # Get or create customer
    customer, _ = Customer.objects.get_or_create(phone=phone)

    return Response({
        'id':    customer.id,
        'phone': customer.phone,
        'name':  customer.name,
    })


@api_view(['PATCH'])
def update_customer(request, customer_id):
    """Update customer name."""
    try:
        customer = Customer.objects.get(id=customer_id)
    except Customer.DoesNotExist:
        return Response({'error': 'Customer not found'}, status=404)

    name = request.data.get('name', '').strip()
    if not name:
        return Response({'error': 'Name cannot be empty'}, status=400)

    customer.name = name
    customer.save()
    return Response({'id': customer.id, 'phone': customer.phone, 'name': customer.name})


# ── Order endpoints ─────────────────────────────────────────

@api_view(['POST'])
def place_order(request):
    """Save a new order to the database."""
    customer_id = request.data.get('customer_id')
    items_data  = request.data.get('items', [])
    total       = request.data.get('total', 0)

    if not customer_id or not items_data:
        return Response({'error': 'customer_id and items are required'}, status=400)

    try:
        customer = Customer.objects.get(id=customer_id)
    except Customer.DoesNotExist:
        return Response({'error': 'Customer not found'}, status=404)

    order = Order.objects.create(customer=customer, total=total)

    for it in items_data:
        menu_item = None
        if it.get('id'):
            menu_item = MenuItem.objects.filter(id=it['id']).first()
        OrderItem.objects.create(
            order=order,
            menu_item=menu_item,
            name=it.get('name', ''),
            price=it.get('price', 0),
            qty=it.get('qty', 1),
        )

    return Response({'order_id': order.id, 'message': 'Order placed successfully'})


@api_view(['GET'])
def order_history(request, customer_id):
    """Get all orders for a customer."""
    try:
        customer = Customer.objects.get(id=customer_id)
    except Customer.DoesNotExist:
        return Response({'error': 'Customer not found'}, status=404)

    orders = Order.objects.filter(customer=customer).prefetch_related('items').order_by('-created_at')
    data = []
    for o in orders:
        data.append({
            'id':    o.id,
            'date':  o.created_at.strftime('%d %b %Y, %I:%M %p'),
            'total': float(o.total),
            'items': [{'name': i.name, 'qty': i.qty, 'price': float(i.price)} for i in o.items.all()],
        })

    return Response(data)


# ── Chat endpoint ───────────────────────────────────────────

@api_view(['POST'])
def chat(request):
    user_message = request.data.get('message', '')
    history      = request.data.get('history', [])

    if not user_message:
        return Response({'error': 'message is required'}, status=400)

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

    messages = [{'role': 'system', 'content': system_prompt}]
    for h in history[-6:]:
        role = 'user' if h.get('role') == 'user' else 'assistant'
        messages.append({'role': role, 'content': h.get('text', '')})
    messages.append({'role': 'user', 'content': user_message})

    completion = client.chat.completions.create(
        model='llama-3.3-70b-versatile',
        messages=messages,
        max_tokens=1000,
        temperature=0.2,
    )

    reply     = completion.choices[0].message.content.strip()
    suggested = []
    suggested_ids = []
    reply_txt = reply

    if 'SUGGEST:' in reply:
        parts     = reply.split('SUGGEST:')
        reply_txt = parts[0].strip()
        raw       = parts[-1].strip().split('\n')[0]
        if raw.lower() != 'none':
            suggested = [s.strip() for s in raw.split(',') if s.strip()]
            name_to_id = {i.name.lower().strip(): i.id for i in items}
            suggested_ids = [
                name_to_id[n.lower().strip()]
                for n in suggested
                if n.lower().strip() in name_to_id
            ]

    return Response({'reply': reply_txt, 'suggested': suggested, 'suggested_item_ids': suggested_ids})
