const bazaDeDate = [
    { nume: "Alex", varsta: 23, id: "1" },
    { nume: "Andrei", varsta: 25, id: '2' },
    { nume: "Maria", varsta: 22, id: '3' },
    { nume: "Ioana", varsta: 24, id: '4' },
    { nume: "Mihai", varsta: 26, id: '5' }
];


class UserService {
    static getUserById = (id) => {
        return bazaDeDate.filter((user) => user.id === id);
    }
}
