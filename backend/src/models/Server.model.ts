import mongoose, { Schema, Document } from 'mongoose';

export interface IServer extends Document {
  name: string;
  status: 'online' | 'offline';
  ip: string;
  cpu: string;
  ram: string;
}

const ServerSchema: Schema = new Schema({
  name: { type: String, required: true },
  status: { type: String, default: 'online' },
  ip: { type: String, default: '45.249.79.52' },
  cpu: { type: String, default: '0%' },
  ram: { type: String, default: '0%' }
});

export default mongoose.model<IServer>('Server', ServerSchema);