import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal, ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';

type WebViewRef = React.ElementRef<typeof WebView>;
const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.28:8080';

// 🟢 User-Agent tự động phù hợp với từng nền tảng iOS / Android
const DEFAULT_USER_AGENT = Platform.select({
    ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
    android: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36',
    default: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
});

interface MapHomeProps {
    isFullscreen: boolean;
    setIsFullscreen: (val: boolean) => void;
    mapDataFromApi?: any;
}

export default function MapHome({
    isFullscreen,
    setIsFullscreen,
    mapDataFromApi,
}: MapHomeProps) {
    const webViewRef = useRef<WebViewRef | null>(null);
    const [geojsonData, setGeojsonData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // 1. Fetch Dữ liệu GeoJSON phía React Native trước khi truyền vào WebView
    useEffect(() => {
        const loadGeojson = async () => {
            if (!mapDataFromApi) {
                setGeojsonData(null);
                return;
            }

            setLoading(true);
            try {
                if (typeof mapDataFromApi === 'object') {
                    setGeojsonData(mapDataFromApi);
                } else if (typeof mapDataFromApi === 'string') {
                    const trimmed = mapDataFromApi.trim();
                    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                        setGeojsonData(JSON.parse(trimmed));
                    } else {
                        const fileUrl = trimmed.startsWith('http')
                            ? trimmed
                            : `${baseUrl}/${trimmed.replace(/^\/+/, '')}`;

                        console.log('Tải GeoJSON cho WebView từ:', fileUrl);
                        const res = await axios.get(fileUrl);
                        setGeojsonData(res.data);
                    }
                }
            } catch (error) {
                console.error('Lỗi khi tải GeoJSON:', error);
                setGeojsonData(null);
            } finally {
                setLoading(false);
            }
        };

        loadGeojson();
    }, [mapDataFromApi]);

    // 2. Gửi dữ liệu mới sang WebView mỗi khi geojsonData cập nhật
    useEffect(() => {
        if (geojsonData && webViewRef.current) {
            const script = `
        if (window.renderGeoJSON) {
          window.renderGeoJSON(${JSON.stringify(geojsonData)});
        }
        true;
      `;
            webViewRef.current.injectJavaScript(script);
        }
    }, [geojsonData]);

    // HTML Template Leaflet sử dụng Stadia Maps (Alidade Smooth)
    const leafletHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin=""/>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
      <style>
        html, body, #map {
          height: 100%;
          width: 100%;
          margin: 0;
          padding: 0;
          background: #f8fafc;
        }
        .leaflet-container { outline: none; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', {
          zoomControl: false,
          attributionControl: false
        }).setView([16.047079, 108.20623], 6);

        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; Stadia Maps &copy; OpenStreetMap'
        }).addTo(map);

        var currentLayer = null;

        window.renderGeoJSON = function(geojsonData) {
          if (!geojsonData) return;
          try {
            if (currentLayer) {
              map.removeLayer(currentLayer);
            }
            currentLayer = L.geoJSON(geojsonData, {
              style: {
                color: '#0A9646',
                opacity: 0.9,
                weight: 6,
                lineCap: 'round',
                lineJoin: 'round'
              }
            }).addTo(map);

            var bounds = currentLayer.getBounds();
            if (bounds.isValid()) {
              map.fitBounds(bounds, {
                padding: [30, 30],
                maxZoom: 14,
                animate: true
              });
            }
          } catch (e) {
            console.error("Lỗi vẽ GeoJSON:", e);
          }
        };

        ${geojsonData ? `window.renderGeoJSON(${JSON.stringify(geojsonData)});` : ''}
      </script>
    </body>
    </html>
  `;

    const renderContent = (fullscreen: boolean) => (
        <View style={fullscreen ? styles.fullscreenWrapper : styles.mapWrapper}>
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="small" color="#00A859" />
                </View>
            )}

            <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                source={{ html: leafletHtml }}
                style={styles.webview}
                scrollEnabled={false}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                userAgent={DEFAULT_USER_AGENT}
                mixedContentMode="always"
                allowFileAccess={true}
                allowUniversalAccessFromFileURLs={true}
                onLoadEnd={() => {
                    if (geojsonData && webViewRef.current) {
                        webViewRef.current.injectJavaScript(`
              if (window.renderGeoJSON) {
                window.renderGeoJSON(${JSON.stringify(geojsonData)});
              }
              true;
            `);
                    }
                }}
            />

            {fullscreen && (
                <TouchableOpacity
                    style={styles.escButton}
                    onPress={() => setIsFullscreen(false)}
                    activeOpacity={0.8}
                >
                    <MaterialIcons name="close" size={16} color="#262626" />
                    <Text style={styles.escText}>ESC</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <>
            {renderContent(false)}

            <Modal
                visible={isFullscreen}
                animationType="slide"
                onRequestClose={() => setIsFullscreen(false)}
            >
                {renderContent(true)}
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    mapWrapper: {
        width: '100%',
        height: 280,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#F8FAFC',
        position: 'relative',
    },
    fullscreenWrapper: {
        flex: 1,
        backgroundColor: '#0F172A',
        position: 'relative',
    },
    webview: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    escButton: {
        position: 'absolute',
        top: 44,
        right: 16,
        zIndex: 1000,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#FFFFFF',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#D9D9D9',
        elevation: 4,
    },
    escText: {
        fontWeight: 'bold',
        color: '#262626',
        fontSize: 13,
    },
});