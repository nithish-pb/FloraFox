from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Contact
from .serializers import ContactSerializer

@api_view(["POST"])
def submit_contact_form(request):
    serializer = ContactSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Message sent successfully!"}, status=201)
    return Response(serializer.errors, status=400)

@api_view(["GET", "PATCH"])
def contact_details(request, contact_id=None):
    if request.method == "GET":
        if contact_id is None:  # If no contact_id is provided, return all contacts
            contacts = Contact.objects.all()
            serializer = ContactSerializer(contacts, many=True)
            return Response(serializer.data)
        
        # If contact_id is provided, return details of that specific contact
        contact = Contact.objects.get(id=contact_id)
        serializer = ContactSerializer(contact)
        return Response(serializer.data)

    if request.method == "PATCH":
        contact = Contact.objects.get(id=contact_id)
        serializer = ContactSerializer(contact, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
