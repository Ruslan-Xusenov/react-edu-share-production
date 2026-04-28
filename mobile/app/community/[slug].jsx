import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { WebView } from 'react-native-webview';
import { COLORS, SPACING } from '../../src/utils/theme';
import apiClient from '../../src/api/client';

const { width } = Dimensions.get('window');

const ArticleDetailScreen = () => {
  const { slug } = useLocalSearchParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [webViewHeight, setWebViewHeight] = useState(300);

  useEffect(() => {
    fetchArticle();
  }, [slug]);

  const fetchArticle = async () => {
    try {
      const res = await apiClient.get(`/community/articles/${slug}/`);
      setArticle(res.data);
      apiClient.get(`/community/articles/${slug}/increment_views/`).catch(() => {});
    } catch (err) {
      console.error('Error fetching article detail:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!article) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Maqola topilmadi.</Text>
      </View>
    );
  }

  // HTML content WebView uchun
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 16px;
          line-height: 1.7;
          color: #a0b8b0;
          background: transparent;
          padding: 0;
          word-wrap: break-word;
        }
        p { margin-bottom: 14px; }
        h1, h2, h3 { color: #F7E7CE; margin: 20px 0 10px; }
        img { max-width: 100%; border-radius: 8px; }
        a { color: #4ade80; }
        ul, ol { margin-left: 20px; margin-bottom: 14px; }
        li { margin-bottom: 6px; }
        blockquote {
          border-left: 3px solid #4ade80;
          padding-left: 12px;
          margin: 14px 0;
          color: #6b8f85;
        }
        code {
          background: #234d43;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 14px;
        }
        pre {
          background: #234d43;
          padding: 12px;
          border-radius: 8px;
          overflow-x: auto;
          margin: 14px 0;
        }
      </style>
    </head>
    <body>
      ${article.content || '<p>Kontent mavjud emas.</p>'}
      <script>
        window.ReactNativeWebView.postMessage(document.body.scrollHeight);
      </script>
    </body>
    </html>
  `;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Stack.Screen
        options={{
          title: 'Maqola',
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.surface },
          headerTintColor: COLORS.text,
        }}
      />

      {/* Thumbnail */}
      {article.thumbnail_url ? (
        <Image
          source={{ uri: article.thumbnail_url }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
          <Text style={{ fontSize: 48 }}>📰</Text>
        </View>
      )}

      <View style={styles.content}>
        {/* Sarlavha */}
        <Text style={styles.title}>{article.title}</Text>

        {/* Muallif */}
        <View style={styles.authorSection}>
          {article.author_info?.avatar_url ? (
            <Image
              source={{ uri: article.author_info.avatar_url }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={{ color: COLORS.primary, fontWeight: '700' }}>
                {(article.author_info?.full_name || 'A')[0].toUpperCase()}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.authorName}>{article.author_info?.full_name || 'Muallif'}</Text>
            <Text style={styles.date}>
              {new Date(article.created_at).toLocaleDateString('uz-UZ', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </Text>
          </View>
        </View>

        {/* HTML kontent - WebView */}
        <View style={[styles.body, { height: webViewHeight }]}>
          <WebView
            source={{ html: htmlContent }}
            style={styles.webview}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            onMessage={(e) => {
              const h = parseInt(e.nativeEvent.data);
              if (h && h > 0) setWebViewHeight(h + 20);
            }}
            backgroundColor="transparent"
            originWhitelist={['*']}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  thumbnail: {
    width: '100%',
    height: 220,
  },
  thumbnailPlaceholder: {
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: SPACING.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
    lineHeight: 30,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: SPACING.sm,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  date: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  body: {
    minHeight: 200,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
  },
  errorText: {
    color: COLORS.textMuted,
    fontSize: 16,
  },
});

export default ArticleDetailScreen;
