from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker, declarative_base

from services.root import Root

engine = create_engine(f'sqlite:///{Root.app_dir()}\\database\\pokemasters.sqlite3',
                       pool_size=20, max_overflow=10)
db_session = scoped_session(sessionmaker(autocommit=False,
                                         autoflush=True,
                                         bind=engine))
Base = declarative_base()
Base.query = db_session.query_property()

def init_db():
    # import all modules here that might define models so that
    # they will be registered properly on the metadata.  Otherwise
    # you will have to import them first before calling init_db()
    import interfaces.models
    Base.metadata.create_all(bind=engine)
