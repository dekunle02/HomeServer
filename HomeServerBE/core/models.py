from django.db import models

class Frame(models.Model):
    name = models.CharField(max_length=100)
    photo = models.ImageField(upload_to='frames/')

    def __str__(self):
        return self.name
