from django.db import models

class Contact(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    description = models.TextField()
    submitted_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=[("Not Viewed", "Not Viewed"), ("Viewed", "Viewed")], default="Not Viewed")

    def __str__(self):
        return f"{self.name} - {self.email} ({self.status})"

