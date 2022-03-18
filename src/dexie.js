import Dexie from 'dexie';

export const db = new Dexie('myDb');
db.version(1).stores({
    friendList : '++key,id,active,lastMessage,name,phone'
})

db.open()
