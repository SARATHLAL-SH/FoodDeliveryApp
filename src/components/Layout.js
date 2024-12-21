// src/components/Layout.js
import React from 'react';
import {View, StyleSheet} from 'react-native';
import Navbar from './Navbar';

const Layout = ({children}) => {
  return (
    <View style={styles.container}>
      <Navbar />
      <View style={styles.content}>
        {children} {/* All screen content goes here */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1, // Takes the rest of the space below the navbar
  },
});

export default Layout;
