CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    type INTEGER NOT NULL
);

CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE videos (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    transcript TEXT NOT NULL,
    CONSTRAINT fk_session FOREIGN KEY (session_id) REFERENCES sessions(id)
);

CREATE INDEX sessions_user_id on sessions(user_id);
CREATE INDEX videos_session_id on videos(session_id);
