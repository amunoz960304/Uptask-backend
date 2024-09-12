import User, { type IUser } from '../models/User';

export default class UserRepository extends User {
  static getByEmail = async (email: IUser['email']) => {
    return await User.findOne({ email });
  };

  static getById = async (id: IUser['id']) => {
    const user = await User.findById(id);

    if (!user) {
      const error = new Error(`El usuario con el id ${id} no existe`);
      throw error;
    }

    return user;
  };
}
