# --- START OF CHANGE ---
# Use a newer Python base image that supports Django 5
FROM python:3.11-slim
# --- END OF CHANGE ---

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install system dependencies
RUN apt-get update && apt-get install -y build-essential libpq-dev vim procps curl net-tools

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy the rest of the backend application code
COPY . .

# The container will listen on this port
EXPOSE 8000