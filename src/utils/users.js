const users = [];

const addUser = ({ id, username, room }) => {
  // Cleaning the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // validate
  if (!username || !room) {
    return { error: "username and room is required" };
  }

  //Checkfor existing user
  const existinguser = users.find((user) => {
    return user.username === username && user.room === room;
  });

  if (existinguser) {
    return { error: "Username already Exists" };
  }

  // Store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter((user) => user.room === room);
};

module.exports = { getUser, getUsersInRoom, addUser, removeUser };
