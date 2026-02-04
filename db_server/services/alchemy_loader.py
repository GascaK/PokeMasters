from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker, declarative_base

from services.root import Root

engine = create_engine(f"sqlite:////app/database/pokemasters.sqlite3",
                       connect_args={"check_same_thread": False})
Session = scoped_session(sessionmaker(autocommit=False,
                                         autoflush=True,
                                         expire_on_commit=False,
                                         bind=engine))
Base = declarative_base()
#Base.query = Session.query_property()

def init_db():
    # import all modules here that might define models so that
    # they will be registered properly on the metadata.  Otherwsse
    # you will have to import them first before calling init_db()
    import interfaces.models
    Base.metadata.create_all(bind=engine)
