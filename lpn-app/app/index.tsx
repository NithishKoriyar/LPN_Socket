import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import io from 'socket.io-client';
import { requestNotificationPermissions, triggerLocalNotification } from './notificationService'; // Adjust the import path as necessary

const socket = io('http://localhost:4000');

const App = () => {
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState([]);
  const [recipient, setRecipient] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Request notification permissions when the component mounts
    requestNotificationPermissions();
  }, []);

  useEffect(() => {
    socket.on('userList', (userList) => {
      setUsers(userList);
    });

    socket.on('notification', ({ title, body }) => {
      console.log("Notification received:", { title, body });
      triggerLocalNotification(title, body);
    });

    return () => {
      socket.off('userList');
      socket.off('notification');
    };
  }, []);

  const registerUser = () => {
    socket.emit('register', username);
  };

  const sendNotification = () => {
    socket.emit('sendNotification', { recipient, title, body: message });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification App</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />
        <Button title="Register" onPress={registerUser} />
      </View>
      <View style={styles.userList}>
        <Text style={styles.subtitle}>Click on a user below to send them a notification</Text>
        <FlatList
          data={users}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setRecipient(item)}>
              <Text style={styles.userItem}>{item}</Text>
            </TouchableOpacity>
          )}
        />

      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="Message"
          value={message}
          onChangeText={setMessage}
        />
        <Button title="Send Notification" onPress={sendNotification} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  userList: {
    marginBottom: 20,
  },
  userItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  instruction: {
    fontSize: 14,
    color: 'gray',
    marginTop: 10,
  },
});

export default App;
