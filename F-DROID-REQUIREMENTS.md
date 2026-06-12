# متطلبات F-Droid 🛍️

دليل شامل لتوافق هذا المشروع مع معايير متجر F-Droid.

## ✅ المتطلبات المستوفاة

### 1. الرخصة المقبولة
- **الرخصة الحالية:** GNU General Public License v3.0
- **الحالة:** ✅ مقبولة بالكامل
- **الملف:** `LICENSE`

### 2. عدم التتبع (No Tracking)
- ❌ لا توجد مكتبات إحصائيات (Analytics)
- ❌ لا توجد إعلانات
- ❌ لا يوجد تتبع للمستخدمين
- ✅ احترام خصوصية المستخدم

### 3. المكتبات المفتوحة المصدر
- ✅ جميع الاعتماديات مفتوحة المصدر
- ✅ لا توجد مكتبات احتكارية
- ✅ توثيق كامل للاعتماديات في `package.json`

### 4. البناء من المصدر
```bash
# يجب أن يكون بناء التطبيق من المصدر ممكناً:
npm install
npm run build
# النتيجة: APK موقع وموثوق
```

### 5. إصدارات منتظمة
- ✅ استخدام Git tags للإصدارات
- ✅ ملف CHANGELOG للتوثيق
- ✅ إصدارات محددة في `package.json`

## 📋 الخطوات التالية للنشر على F-Droid

### 1. إعداد fastlane (اختياري لكن مفيد)
```bash
npm install -D fastlane
fastlane init android
```

### 2. إضافة ملف F-Droid metadata
إنشاء: `fastlane/metadata/android/en-US/full_description.txt`

### 3. إعداد GitHub Release
- تأكد من إنشاء tags للإصدارات
- إضافة ملفات APK وAPKs إلى الإصدارات

### 4. فتح Pull Request في F-Droid
- زيارة: https://gitlab.com/fdroid/fdroiddata
- إنشاء ملف metadata جديد
- تقديم المعلومات المطلوبة

## 📝 ملف Metadata المقترح

```yaml
# metadata/com.omniwifi.x.yml
Categories:
  - Connectivity
License: GPL-3.0-only
SourceCode: https://github.com/aregy1ai/OmniWiFi-X
IssueTracker: https://github.com/aregy1ai/OmniWiFi-X/issues
Summary: تطبيق WiFi متقدم وشامل
Description: |
  تطبيق متكامل لإدارة والتحكم في شبكات الواي فاي
  مع ميزات متقدمة وواجهة سهلة الاستخدام.
```

## 🔐 متطلبات الأمان

- ✅ عدم استخدام صلاحيات غير ضرورية
- ✅ عدم الوصول إلى بيانات حساسة
- ✅ تشفير الاتصالات
- ✅ عدم تخزين كلمات مرور بدون تشفير

## 📊 فحص التوافقية

قبل التقديم، تأكد من:

```bash
# 1. فحص الكود
npm run lint

# 2. بناء APK النهائي
npm run build:release

# 3. التوقيع الرسمي
# استخدم مفتاح خاص آمن

# 4. اختبار التطبيق
npm run test
```

## 🚀 نصائح مهمة

1. **الإصدار الأول:** قد يستغرق المراجعة 1-2 أسبوع
2. **التحديثات:** الإصدارات اللاحقة أسرع في المراجعة
3. **الدعم:** فريق F-Droid متعاون وساعد جداً
4. **التواثيق:** الوثائق الكاملة تزيد فرص القبول

## 📞 روابط مفيدة

- [F-Droid Android Integration](https://f-droid.org/en/docs/Submitting_an/Submitting_an_app/)
- [F-Droid GitLab Repo](https://gitlab.com/fdroid/fdroiddata)
- [معايير التطبيقات](https://f-droid.org/en/docs/Inclusion_Policy/)

---

**آخر تحديث:** 2024
**الحالة:** جاهز للنشر على F-Droid ✅
