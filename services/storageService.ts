
import { Dexie, type EntityTable } from 'dexie';
import { AppState, User } from '../types';

// Define the database schema
interface UserData extends AppState {
  userId: string;
}

// TNPSC Study OS Database implementation using Dexie
// Using a named import for the Dexie class ensures that the TypeScript compiler correctly identifies all inherited prototype methods such as version().
class TNPSCDatabase extends Dexie {
  users!: EntityTable<User, 'id'>;
  userData!: EntityTable<UserData, 'userId'>;

  constructor() {
    super('TNPSC_StudyOS_DB');
    // Defining database version and schema stores
    // this.version() is an inherited instance method from the Dexie base class
    this.version(1).stores({
      users: 'id, username',
      userData: 'userId'
    });
  }
}

const db = new TNPSCDatabase();

export const saveUserData = async (state: AppState) => {
  if (!state.user) return;
  await db.userData.put({
    ...state,
    userId: state.user.id
  });
};

export const loadUserData = async (userId: string): Promise<AppState | null> => {
  const data = await db.userData.get(userId);
  return data || null;
};

export const registerUser = async (username: string): Promise<User> => {
  const newUser: User = {
    id: crypto.randomUUID(),
    username,
    lastLogin: new Date().toISOString()
  };
  await db.users.add(newUser);
  return newUser;
};

export const authenticateUser = async (username: string): Promise<User | null> => {
  const user = await db.users.where('username').equals(username).first();
  if (user) {
    await db.users.update(user.id, { lastLogin: new Date().toISOString() });
    return user;
  }
  return null;
};

export const getAllUsers = async () => {
  return await db.users.toArray();
};

export const clearSession = () => {
  localStorage.removeItem('active_session_id');
};

export const saveSessionId = (id: string) => {
  localStorage.setItem('active_session_id', id);
};

export const getSessionId = () => {
  return localStorage.getItem('active_session_id');
};
