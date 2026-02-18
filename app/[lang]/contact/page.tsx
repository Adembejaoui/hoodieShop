"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from 'next-intl';

import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle
} from "lucide-react";

export default function ContactPage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const t = useTranslations('contact');
  const tInfo = useTranslations('contact.info');
  const tForm = useTranslations('contact.form');
  const tFaq = useTranslations('contact.faq');
  const tSubjects = useTranslations('contact.form.subjects');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };

    console.log("Submitting contact form:", data);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        console.log("Form submitted successfully!");
        setSuccess(true);
        // Wait a bit before reloading to ensure data is saved
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        const errorData = await response.json();
        console.error("Server error:", errorData);
        alert(t('error') + ": " + (errorData.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(t('error'));
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4">
            <Mail className="w-3 h-3 mr-1" />
            {t('badge')}
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-foreground">
            {t('heroTitle')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('heroDescription')}
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-secondary/50 rounded-xl border">
              <Mail className="w-5 h-5 text-purple-600 mb-4" />
              <h3 className="font-semibold mb-1">{tInfo('email.title')}</h3>
              <p className="text-sm font-medium">{tInfo('email.value')}</p>
              <p className="text-xs text-muted-foreground">{tInfo('email.note')}</p>
            </div>
            <div className="p-6 bg-secondary/50 rounded-xl border">
              <Phone className="w-5 h-5 text-purple-600 mb-4" />
              <h3 className="font-semibold mb-1">{tInfo('phone.title')}</h3>
              <p className="text-sm font-medium">{tInfo('phone.value')}</p>
              <p className="text-xs text-muted-foreground">{tInfo('phone.note')}</p>
            </div>
            <div className="p-6 bg-secondary/50 rounded-xl border">
              <Clock className="w-5 h-5 text-purple-600 mb-4" />
              <h3 className="font-semibold mb-1">{tInfo('hours.title')}</h3>
              <p className="text-sm font-medium">{tInfo('hours.value')}</p>
              <p className="text-xs text-muted-foreground">{tInfo('hours.note')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="p-6 lg:p-8 bg-secondary/30 rounded-2xl border">
              <h2 className="text-2xl font-bold mb-2">{tForm('title')}</h2>
              <p className="text-muted-foreground mb-6">
                {tForm('description')}
              </p>

              {status === "loading" ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : success ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    <p className="font-medium">{tForm('success')}</p>
                  </div>
                  <p className="text-sm text-green-600 mt-2">
                    {tForm('successDescription')}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{tForm('yourName')} *</label>
                    <input 
                      type="text"
                      name="name"
                      required
                      placeholder="John Doe"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{tForm('emailAddress')} *</label>
                    <input 
                      type="email"
                      name="email"
                      required
                      placeholder="john@example.com"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('subject')} *</label>
                  <select 
                    name="subject"
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">{tForm('selectSubject')}</option>
                    <option value="order">{tSubjects('order')}</option>
                    <option value="product">{tSubjects('product')}</option>
                    <option value="shipping">{tSubjects('shipping')}</option>
                    <option value="returns">{tSubjects('returns')}</option>
                    <option value="wholesale">{tSubjects('wholesale')}</option>
                    <option value="other">{tSubjects('other')}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{tForm('messageLabel')} *</label>
                  <textarea
                    name="message"
                    required
                    placeholder={tForm('messagePlaceholder')}
                    rows={5}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading || !session}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md"
                >
                  {isLoading ? tForm('sending') : !session ? tForm('signInRequired') : t('sendMessage')}
                </button>
              </form>
              )}
            </div>

            {/* FAQ Quick Answers */}
            <div>
              <h2 className="text-2xl font-bold mb-6">{tFaq('title')}</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-secondary/30 rounded-lg border">
                  <h3 className="font-semibold mb-2">{tFaq('shipping.question')}</h3>
                  <p className="text-sm text-muted-foreground">{tFaq('shipping.answer')}</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg border">
                  <h3 className="font-semibold mb-2">{tFaq('returns.question')}</h3>
                  <p className="text-sm text-muted-foreground">{tFaq('returns.answer')}</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg border">
                  <h3 className="font-semibold mb-2">{tFaq('tracking.question')}</h3>
                  <p className="text-sm text-muted-foreground">{tFaq('tracking.answer')}</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg border">
                  <h3 className="font-semibold mb-2">{tFaq('changeOrder.question')}</h3>
                  <p className="text-sm text-muted-foreground">{tFaq('changeOrder.answer')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
