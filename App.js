import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {createStackNavigator} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import SignOut from './src/screens/Signout';
import Navbar from './src/components/Navbar'; // Import Navbar component
import {LoginProvider, useLogin} from './src/context/LoginContext'; // Import Login context
import ConfirmOrder from './src/screens/ConfirmOrder';
import OrderHistory from './src/screens/OrderHistory';
import MapScreen from './src/screens/MapScreen';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const App = () => {
  return (
    <LoginProvider>
      <MainNavigator />
    </LoginProvider>
  );
};

// Separate component for handling navigation logic
const MainNavigator = () => {
  const {isLoggedIn, setIsLoggedIn} = useLogin();

  // Check login status on app load
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) setIsLoggedIn(true);
      } catch (error) {
        console.log('Error checking login status:', error);
      }
    };
    checkLoginStatus();
  }, [setIsLoggedIn]);

  return (
    <NavigationContainer>
      {!isLoggedIn ? (
        // If not logged in, show login screen
        <Drawer.Navigator screenOptions={{headerShown: false}}>
          <Drawer.Screen name="Login" component={LoginScreen} />
        </Drawer.Navigator>
      ) : (
        // If logged in, show stack navigator with Navbar and drawer
        <Stack.Navigator>
          {/* Navbar should appear for all drawer screens */}
          <Stack.Screen
            name="Navbar"
            component={NavbarWrapper} // A wrapper component to render the Navbar and Drawer
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Map"
            component={MapScreen} // A wrapper component to render the Navbar and Drawer
            options={{headerShown: false}}
          />
          {/* <Stack.Screen
            name="Confirm Order"
            component={ConfirmOrder}
            options={{headerShown: false}}
          /> */}
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

// A wrapper to combine Navbar and DrawerNavigator
const NavbarWrapper = () => {
  return (
    <>
      <Navbar />
      <Drawer.Navigator initialRouteName="Home">
        <Drawer.Screen
          name="Home"
          component={HomeScreen}
          options={{headerShown: false}}
        />
        <Drawer.Screen
          name="Order History"
          component={OrderHistory}
          options={{headerShown: false}}
        />
        <Drawer.Screen
          name="Confirm Order"
          component={ConfirmOrder}
          options={{headerShown: false}}
        />
        <Drawer.Screen
          name="Sign Out"
          component={SignOut}
          options={{headerShown: false}}
        />
        
      </Drawer.Navigator>
    </>
  );
};

export default App;
