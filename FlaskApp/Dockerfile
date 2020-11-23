FROM python:3.8-slim


RUN apt update -y  &&  apt upgrade -y && apt-get update 
RUN apt-get update && apt-get install -y \
    curl \
    gcc \
    unixodbc-dev

RUN apt-get install --reinstall build-essential -y

COPY requirements.txt requirements.txt
RUN pip3 install --upgrade pip


RUN pip3 install -r requirements.txt

COPY . .

EXPOSE 5001

ENTRYPOINT [ "python3" ]
CMD [ "application.py" ]