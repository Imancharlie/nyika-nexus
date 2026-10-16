from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("community", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="post",
            name="video_file",
            field=models.FileField(blank=True, null=True, upload_to="posts/videos/"),
        ),
    ]
