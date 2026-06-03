"""
Jidex Homes & Properties — FastAPI Application
===============================================
This is the entry point of our backend API.

For now, we just have a simple "Hello World" endpoint
to confirm the server runs correctly.

We will grow this file as we build features.
"""

from fastapi import FastAPI

# Create the FastAPI application instance
# Think of this as "starting up the restaurant"
app = FastAPI(
    title="Jidex Homes & Properties API",
    description="Premium Property Marketplace Platform",
    version="1.0.0",
)


# Define our first endpoint (a "menu item")
# When someone visits /, they get this response
@app.get("/")
def read_root():
    """
    Root endpoint — confirms the API is running.
    """
    return {
        "message": "Welcome to Jidex Homes & Properties API",
        "status": "running",
        "version": "1.0.0",
    }


# A simple health check endpoint
# Used by deployment platforms to verify the app is alive
@app.get("/health")
def health_check():
    """
    Health check endpoint.
    Returns a simple status response.
    """
    return {
        "status": "healthy",
        "app": "Jidex Homes & Properties",
    }