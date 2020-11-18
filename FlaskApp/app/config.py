import os 
import urllib

class Config():
    
    connString = urllib.parse.quote_plus("DRIVER={ODBC Driver 17 for SQL Server};"
                                        "SERVER=oxypocserver.database.windows.net;"
                                        "DATABASE=gaslift;"
                                        "UID=oxypocserver;"
                                        "PWD=weofcv*498")
    JWT_SECRET_KEY = 'CrazYH4Rd2Gu3ssM3!!'
    JWT_ACCESS_TOKEN_EXPIRES = 86400