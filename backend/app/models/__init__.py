"""
Models Package
==============
This file imports all models so they are registered with SQLAlchemy's
Base.metadata. This is necessary for:

- Alembic to detect models when generating migrations
- SQLAlchemy to know about ALL tables when querying relationships

Pattern:
- Each new model file gets one import line here
- The # noqa comments tell linters the unused-import is intentional
"""

from app.models.user import User  # noqa: F401