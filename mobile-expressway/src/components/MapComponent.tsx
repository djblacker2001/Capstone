import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { WebView as RNWebView } from 'react-native-webview';
import axiosClient from '../api/axiosClient';

const WebViewComponent = RNWebView as any;
const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';

interface MapComponentProps {
  geojsonData: any;
  height?: number | string;
}

export default function MapComponent({ geojsonData, height = 240 }: MapComponentProps) {
  const webViewRef = useRef<any>(null);
  const [parsedGeoJson, setParsedGeoJson] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const loadMapData = async () => {
      setLoading(true);

      if (!geojsonData) {
        if (isMounted) setLoading(false);
        return;
      }

      if (typeof geojsonData === 'object') {
        if (isMounted) {
          setParsedGeoJson(geojsonData);
          setLoading(false);
        }
        return;
      }

      if (typeof geojsonData === 'string' && geojsonData.trim() !== '') {
        try {
          const cleanPath = geojsonData.trim();
          const fullUrl = cleanPath.startsWith('http')
            ? cleanPath
            : `${baseUrl}/${cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath}`;

          const res = await axiosClient.get(fullUrl);
          if (isMounted) {
            setParsedGeoJson(res.data);
          }
        } catch (err) {
          console.error('Lỗi khi tải file GeoJSON bản đồ:', err);
        } finally {
          if (isMounted) setLoading(false);
        }
      } else {
        if (isMounted) setLoading(false);
      }
    };

    loadMapData();

    return () => {
      isMounted = false;
    };
  }, [geojsonData]);

  const renderLeafletHTML = (data: any) => {
    const geojsonString = data ? JSON.stringify(data) : 'null';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body, #map { height: 100%; width: 100%; background: #e2e8f0; }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            function initMap() {
              try {
                var map = L.map('map', { 
                  zoomControl: true, 
                  attributionControl: false 
                }).setView([20.8348, 105.884], 10);
                
                // Đổi sang CartoDB Tile Layer (chạy cực mượt trên mobile thật, không bị OSM block)
                var tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
                maxZoom: 19,
                  attribution: '&copy; OpenStreetMap',
                  // Thêm tùy chọn này để không bị mất header khi gửi request trên thiết bị thật
                  referrerPolicy: 'no-referrer-when-downgrade'
                }).addTo(map);

                var geoData = ${geojsonString};
                if (geoData) {
                  var geoLayer = L.geoJSON(geoData, {
                    style: function() {
                      return { color: '#ff3838', weight: 6, opacity: 0.85 };
                    }
                  }).addTo(map);
                  
                  try {
                    var bounds = geoLayer.getBounds();
                    if (bounds.isValid()) {
                      map.fitBounds(bounds, { padding: [30, 30] });
                    }
                  } catch(e) {}
                }

                // Cập nhật lại kích thước map sau khi WebView render xong
                setTimeout(function() {
                  map.invalidateSize();
                }, 500);
              } catch(e) {
                console.error('Init map error:', e);
              }
            }

            if (document.readyState === 'complete') {
              initMap();
            } else {
              window.addEventListener('load', initMap);
            }
          </script>
        </body>
      </html>
    `;
  };

  return (
    <View style={[styles.mapContainer, { height }]}>
      {loading ? (
        <View style={styles.mapLoading}>
          <ActivityIndicator size="small" color="#008744" />
          <Text style={styles.loadingText}>Đang tải bản đồ...</Text>
        </View>
      ) : (
        <WebViewComponent
          ref={webViewRef}
          originWhitelist={['*']}
          source={{
            html: renderLeafletHTML(parsedGeoJson),
            baseUrl: 'https://localhost'
          }}
          style={styles.webViewStyle}
          userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
          allowingReadAccessToURL="*"
          mixedContentMode="always"
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.mapLoading}>
              <ActivityIndicator size="small" color="#008744" />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    width: '100%',
  },
  webViewStyle: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  mapLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    gap: 6,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B',
  },
});