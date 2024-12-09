create table if not exists users
(
    id       serial primary key,
    username varchar(30) not null,
    password varchar(75) not null
    );

alter table users
    owner to postgres;


create table if not exists chats
(
    id   serial                                        not null primary key,
    name varchar(50) default 'Chat'::character varying not null
    );

alter table chats
    owner to postgres;

CREATE TABLE IF NOT EXISTS messages
(
    id     SERIAL PRIMARY KEY,
    text   TEXT,
    "from" INTEGER NOT NULL,
    date   TIMESTAMP WITH TIME ZONE DEFAULT now(),
    chat   INTEGER NOT NULL
    );

ALTER TABLE messages
    OWNER TO postgres;

ALTER TABLE messages
    ADD CONSTRAINT message_from_fkey
        FOREIGN KEY ("from") REFERENCES users (id)
            ON DELETE CASCADE;

ALTER TABLE messages
    ADD CONSTRAINT message_chat_fkey
        FOREIGN KEY (chat) REFERENCES chats (id)
            ON DELETE CASCADE;


create table if not exists chat_users
(
    id      serial primary key not null,
    chat_id integer            not null,
    user_id integer            not null
);

alter table chat_users
    owner to postgres;

alter table chat_users
    add foreign key (chat_id) references chats
        on delete cascade;

alter table chat_users
    add foreign key (user_id) references users
        on delete cascade;

create table if not exists uploadedfiles
(
    id         text not null,
    name       text,
    message_id integer
);

alter table uploadedfiles
    owner to postgres;

alter table uploadedfiles
    add primary key (id);

alter table uploadedfiles
    add constraint message_id
        foreign key (message_id) references messages
            on update cascade on delete cascade;

