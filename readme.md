# Push Notifications with Socket.IO in Expo React Native (Web and Mobile)

## ⚠️ Important Warning
This project implements push notifications using **Socket.IO** and **local push notifications**. It is important to note:

- Notifications **work** when the app is running in the background or when the device is in sleep mode (as long as the app remains open in the background).
- **It does not work** if the app is completely closed or not running.
- If this limitation does not fit your needs, you may consider using Firebase Cloud Messaging (FCM) or other push notification services.

---

## 📌 Overview
This project allows sending notifications between devices using **Node.js**, **Socket.IO**, and **Expo React Native** for both **mobile and web notifications**. Since **Socket.IO** cannot trigger actual push notifications, we use **local push notifications**, ensuring that:

- A standard push notification popup appears.
- Notifications work when the app is in the background or the device is asleep (but the app must be running in the background).
- Works for both **mobile and web**.



## 🛎️ When to Use In-App Notifications Without FCM

Here are some examples where in-app notifications should be available only when the user is active in the app:

1. 🚖 **Active Driver Notifications** – Notify drivers about new ride requests or ride status updates while they are actively using the app.

2. 💬 **Chat Messages in a Support App** – Notify users about new incoming messages only when they have the support chat screen open.

3. 🏦 **Real-Time Auction Updates** – Notify users about new bids or auction closing times when they are viewing the auction screen.

4. 📈 **Stock Market Price Alerts** – Notify users about stock price changes when they are actively monitoring stocks in the app.

5. ⚽ **Live Sports Score Updates** – Notify users about real-time match score changes when they are on the live match screen.

6. 🛠️ **Admin Panel Notifications** – Notify admins about new user reports, verification requests, or support tickets when they are logged into the admin dashboard.

7. 🎮 **Gaming Matchmaking Alerts** – Notify players when they are matched with an opponent only when they are on the matchmaking screen.

8. 📝 **Collaborative Document Editing** – Notify users when a teammate edits a document while they are working on it.



## 🛠️ Technologies Used
- **Node.js** (Backend Server)
- **MongoDB** (To store user `socketId` with `username` for targeted notifications)
- **Socket.IO** (Real-time communication)
- **Expo React Native** (Frontend for mobile and web)
- **Expo Notifications** (For triggering local push notifications)

## 🚀 Features
- **Send notifications to specific users** using stored `socketId` in MongoDB.
- **Standard push notification popup** using local notifications.
- **Works in the background and sleep mode** (as long as the app is open in the background).
- **Supports both mobile and web notifications.**

Got it! Here's how you can structure it with a concise message:

---

## 🔗 [Get Full Source Code](URL_TO_YOUR_REPO)

## 🌟 If you find this project helpful or interesting, please consider giving it a star! 🌟


## 📂 Project Structure
```
lpn-api/                    # Backend (Node.js + Socket.IO + MongoDB)
├── node_modules/
├── package-lock.json
├── package.json
├── server.js               # Main backend server (Handles socket connections, stores user socketId in MongoDB)

lpn-app/                    # Frontend (Expo React Native)
├── .expo/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── notificationService.js  # Main file containing notification logic
├── assets/
├── node_modules/
├── .gitignore
├── app.json
├── expo-env.d.ts
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.json
```

## 🔧 Installation & Setup
### 1️⃣ Backend Setup (Node.js + MongoDB + Socket.IO)
1. Navigate to the backend folder:
   ```sh
   cd lpn-api
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the server:
   ```sh
   node server.js
   ```

### 2️⃣ Frontend Setup (Expo React Native)
1. Navigate to the frontend folder:
   ```sh
   cd lpn-app
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the app:
   ```sh
   npm start
   ```

## 📲 How It Works
1. The **backend** (Node.js with Socket.IO) listens for notification events and stores user `socketId` with `username` in **MongoDB**.
2. When a message is sent from one device, the **Socket.IO server** retrieves the target user's `socketId` and emits the notification only to that user.
3. The **React Native frontend** listens for notifications in `notificationService.js` and triggers **local push notifications**.
4. A push notification popup appears on the device.

## 🎯 Example Usage
### Storing User `socketId` in MongoDB (Backend - `server.js`)
```javascript
// backend/server.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:8081',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/lpn_socket', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define User Schema and Model
const userSchema = new mongoose.Schema({
  username: String,
  socketId: String,
});

const User = mongoose.model('User', userSchema);

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('register', async (username) => {
    await User.create({ username, socketId: socket.id });
    const users = await User.find({}, 'username');
    io.emit('userList', users.map(user => user.username));
  });


  socket.on('sendNotification', async ({ recipient, title, body }) => {
    const user = await User.findOne({ username: recipient });
    if (user) {
      io.to(user.socketId).emit('notification', { title, body });
      console.log(`Message sent to ${recipient}`);
    } else {
      console.log(`Recipient ${recipient} not found`);
    }
  });
  

  

  socket.on('disconnect', async () => {
    await User.deleteOne({ socketId: socket.id });
    const users = await User.find({}, 'username');
    io.emit('userList', users.map(user => user.username));
    console.log('Client disconnected');
  });
});

server.listen(4000, () => {
  console.log('Server is running on port 4000');
});

```



### Handling Notifications in React Native (`notificationService.js`)
```javascript
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Check if the app is running on the web
const isWeb = Platform.OS === 'web';

// Configure notification handler (only for mobile)
if (!isWeb) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

// Function to request notification permissions for mobile
async function requestMobileNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Failed to get push token for notifications!');
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('Expo Push Token:', token);
  return token;
}

// Function to request notification permissions for web
async function requestWebNotificationPermissions() {
  if (!('Notification' in window)) {
    alert('This browser does not support notifications.');
    return;
  }

  if (Notification.permission === 'granted') {
    console.log('Notification permission already granted');
  } else if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      alert('Notification permission denied.');
    }
  }
}

// Function to request notification permissions
export async function requestNotificationPermissions() {
  if (isWeb) {
    await requestWebNotificationPermissions();
  } else {
    await requestMobileNotificationPermissions();
  }
}

function handleWebNotification(title, body) {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications.');
      return;
    }
  
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(title, {
            body: body,
          });
        }
      });
    }
  }
  
  async function handleMobileNotification(title, body) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: body,
          data: { data: 'goes here' },
        },
        trigger: { seconds: 1 },
      });
    } catch (error) {
      console.error('Failed to schedule mobile notification:', error);
    }
  }
  
  

// Function to schedule a local notification
export async function triggerLocalNotification(title, body) {
    if (isWeb) {
      handleWebNotification(title, body);
    } else {
      await handleMobileNotification(title, body);
    }
  }
  
```

### Handling Notifications in React Native (`index.jsx or index.tsx`)
```javascript
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


```




## 🔥 Limitations
- The app **must be running in the background** to receive notifications.
- Does **not** work when the app is completely closed.
- It is **not a substitute for actual push notifications (like Firebase Cloud Messaging or OneSignal).**

## 📝 Conclusion
This project provides a simple and effective way to send notifications using **Socket.IO** and **local push notifications** in Expo React Native for **both web and mobile**. The backend stores `socketId` in MongoDB to target specific users, ensuring personalized notifications. However, for production apps requiring notifications when the app is completely closed, consider using **Firebase Cloud Messaging (FCM)** or similar services.

## 📌 Future Enhancements
- 📈 Improve scalability to handle a large number of users efficiently.

- ⚡ Enhance performance for real-time notifications with minimal latency.

- 🔄 Optimize system architecture for better handling of concurrent users.



---

💡 **Feel free to contribute or modify the project as needed!** 🚀

---



