const UserService = require('../services/UserService.js');

class UserController{
    static getUserById(id) {
        const user = UserService.getUserById(id);
        if(!user) {
            return {error: "User not found"};
        }

        return user;}

}

