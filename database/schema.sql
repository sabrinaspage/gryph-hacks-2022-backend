CREATE TABLE users (
    id SERIAL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    type INTEGER NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY (id ASC)
);

CREATE TABLE sessions (
    id SERIAL,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    CONSTRAINT "sessions_pkey" PRIMARY KEY (id ASC),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);


CREATE TABLE videos (
    id SERIAL,
    session_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    transcript TEXT NOT NULL,
    CONSTRAINT "videos_pkey" PRIMARY KEY (id ASC),
    CONSTRAINT fk_session FOREIGN KEY (session_id) REFERENCES sessions(id)
);

CREATE INDEX sessions_user_id on sessions(user_id);
CREATE INDEX videos_session_id on videos(session_id);
