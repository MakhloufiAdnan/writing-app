import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppHeader } from '../src/components/AppHeader';

export default function HomeScreen() {
  // !! Connecter ces handlers à l’état global (isRecording, etc.) !!
  const handleStart = () => {
    console.log('Démarrer cliqué');
  };

  const handleStop = () => {
    console.log('Terminé cliqué');
  };

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <AppHeader onStartPress={handleStart} onStopPress={handleStop} />

        {/* Ici la zone d’écriture + dashboard */}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#eef2ff',
  },
});
