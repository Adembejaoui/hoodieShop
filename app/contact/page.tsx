import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle
} from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4">
            <Mail className="w-3 h-3 mr-1" />
            Get in Touch
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-foreground">
            We would love to hear from you
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions about our products, need help with an order, or just want 
            to say hello? Our team is here to help!
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-secondary/50 rounded-xl border">
              <Mail className="w-5 h-5 text-purple-600 mb-4" />
              <h3 className="font-semibold mb-1">Email Us</h3>
              <p className="text-sm font-medium">support@hoodielegends.com</p>
              <p className="text-xs text-muted-foreground">We reply within 24 hours</p>
            </div>
            <div className="p-6 bg-secondary/50 rounded-xl border">
              <Phone className="w-5 h-5 text-purple-600 mb-4" />
              <h3 className="font-semibold mb-1">Call Us</h3>
              <p className="text-sm font-medium">+1 (555) 123-4567</p>
              <p className="text-xs text-muted-foreground">Mon-Fri 9AM-6PM EST</p>
            </div>
            <div className="p-6 bg-secondary/50 rounded-xl border">
              <MapPin className="w-5 h-5 text-purple-600 mb-4" />
              <h3 className="font-semibold mb-1">Visit Us</h3>
              <p className="text-sm font-medium">123 Anime Street</p>
              <p className="text-xs text-muted-foreground">New York, NY 10001</p>
            </div>
            <div className="p-6 bg-secondary/50 rounded-xl border">
              <Clock className="w-5 h-5 text-purple-600 mb-4" />
              <h3 className="font-semibold mb-1">Business Hours</h3>
              <p className="text-sm font-medium">Mon - Fri: 9AM - 6PM</p>
              <p className="text-xs text-muted-foreground">Sat: 10AM - 4PM</p>
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
              <h2 className="text-2xl font-bold mb-2">Send us a Message</h2>
              <p className="text-muted-foreground mb-6">
                Fill out the form below and we will get back to you as soon as possible.
              </p>

              <form action="/api/contact" method="POST" className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Name *</label>
                    <input 
                      type="text"
                      name="name"
                      required
                      placeholder="John Doe"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address *</label>
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
                  <label className="text-sm font-medium">Subject *</label>
                  <select 
                    name="subject"
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select a subject</option>
                    <option value="order">Order Inquiry</option>
                    <option value="product">Product Question</option>
                    <option value="shipping">Shipping & Delivery</option>
                    <option value="returns">Returns & Exchanges</option>
                    <option value="wholesale">Wholesale Inquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Message *</label>
                  <textarea
                    name="message"
                    required
                    placeholder="Tell us how we can help you..."
                    rows={5}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* FAQ Quick Answers */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Quick Answers</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-secondary/30 rounded-lg border">
                  <h3 className="font-semibold mb-2">How long does shipping take?</h3>
                  <p className="text-sm text-muted-foreground">Standard shipping takes 5-7 business days. Express shipping (2-3 days) is available at checkout.</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg border">
                  <h3 className="font-semibold mb-2">What is your return policy?</h3>
                  <p className="text-sm text-muted-foreground">We offer a 30-day return policy for unworn, unwashed items with tags attached. Returns are free!</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg border">
                  <h3 className="font-semibold mb-2">Do you ship internationally?</h3>
                  <p className="text-sm text-muted-foreground">Yes! We ship to over 50 countries worldwide. International shipping takes 10-15 business days.</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg border">
                  <h3 className="font-semibold mb-2">How do I track my order?</h3>
                  <p className="text-sm text-muted-foreground">Once your order ships, you will receive an email with tracking information.</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg border">
                  <h3 className="font-semibold mb-2">Can I change my order after placing it?</h3>
                  <p className="text-sm text-muted-foreground">Contact us within 1 hour of placing your order to make changes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
