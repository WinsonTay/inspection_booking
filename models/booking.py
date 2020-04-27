from models.base_model import BaseModel
from playhouse.hybrid import hybrid_property, hybrid_method
import datetime
from datetime import timedelta
import peewee as pw
from random import randint

class User(BaseModel):
    name = pw.CharField(unique=False)
    mobile_num = pw.CharField(unique=True)



class Booking(BaseModel):
    booking_time = pw.DateTimeField(null=False)
    user = pw.ForeignKeyField(User,backref='bookings')
    slot = pw.IntegerField(null=False)