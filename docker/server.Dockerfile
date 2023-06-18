FROM python:3.7-slim

COPY run_backend.py .
COPY requirements.txt .
COPY server/ .

RUN pip3 install -r requirements.txt
CMD ["python","run_backend.py"]