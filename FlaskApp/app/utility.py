from datetime import datetime
import pytz

def getID():
    dt = datetime.now(pytz.timezone('US/Central'))
    id = f'{dt:%Y}{dt:%m}{dt:%d}{dt:%H}{dt:%M}{dt:%S}'
        
    return id

def getPartition():
    dt = datetime.now(pytz.timezone('US/Central'))
    partition = f'{dt:%Y}{dt:%m}{dt:%d}'
        
    return partition