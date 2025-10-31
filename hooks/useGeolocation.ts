
import { useState, useEffect } from 'react';

interface GeolocationState {
  loading: boolean;
  error: GeolocationPositionError | null;
  data: {
    latitude: number;
    longitude: number;
  } | null;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    loading: true,
    error: null,
    data: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      // Geolocation is not supported by this browser.
      // We can handle this case by setting an error state.
      // For now, we'll just log it and stop.
      console.error("Geolocation is not supported by your browser.");
      setState(prevState => ({ ...prevState, loading: false }));
      return;
    }

    const onSuccess = (position: GeolocationPosition) => {
      setState({
        loading: false,
        error: null,
        data: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
      });
    };

    const onError = (error: GeolocationPositionError) => {
      setState({
        loading: false,
        error,
        data: null,
      });
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError);
  }, []);

  return state;
};
