FROM python:latest

WORKDIR /app
COPY db_server /app

RUN pip3 install -r /app/requirements.txt
CMD ["python3", "main.py"]