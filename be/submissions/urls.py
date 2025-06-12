from django.urls import path
from .views import submit_contact_form
from .views import contact_details

urlpatterns = [
    path("contact/", submit_contact_form, name="submit_contact_form"),
    path("contact/<int:contact_id>/", contact_details, name="update_contact_status"),
    path("contact/subs/", contact_details, name="list_contacts"),
]
