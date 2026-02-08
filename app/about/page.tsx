import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Heart, Sparkles, Users, Zap, Shield, Truck } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4">Our Story</Badge>
            
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Born from Passion,
              <br />
              Made for Fans
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8">
              We create premium anime hoodies that celebrate your favorite series with 
              authentic designs, superior quality, and comfort that lasts all day.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/shop">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  Explore Collection
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline">
                  Get in Touch
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4">Our Mission</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold mb-6">
                Connecting Fans Through Fashion
              </h2>
              <p className="text-muted-foreground mb-4">
                At Hoodie Legends, we believe that anime fandom should extend beyond the screen. 
                Our mission is to create high-quality apparel that lets you wear your passion 
                with pride, featuring authentic designs that capture the spirit of your 
                favorite series.
              </p>
              <p className="text-muted-foreground mb-6">
                Every hoodie we produce is crafted with premium materials, vibrant prints 
                that last, and designs that honor the art and stories that bring our 
                community together.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-500">50K+</div>
                  <div className="text-sm text-muted-foreground">Happy Customers</div>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <div className="text-2xl font-bold text-pink-500">100+</div>
                  <div className="text-sm text-muted-foreground">Unique Designs</div>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-500">30+</div>
                  <div className="text-sm text-muted-foreground">Anime Series</div>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-500">99%</div>
                  <div className="text-sm text-muted-foreground">Satisfaction</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-secondary/20 rounded-2xl border">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-24 h-24 rounded-xl bg-purple-600 flex items-center justify-center">
                    <Heart className="w-12 h-12 text-white fill-current" />
                  </div>
                </div>
              </div>
              
              {/* Floating badges */}
              <div className="absolute -top-3 -right-3 p-3 bg-background rounded-lg border shadow-lg">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">Premium Quality</span>
                </div>
              </div>
              <div className="absolute -bottom-3 -left-3 p-3 bg-background rounded-lg border shadow-lg">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Fast Shipping</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4">What We Stand For</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Our Core Values</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-background rounded-xl border">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Authentic Designs</h3>
              <p className="text-sm text-muted-foreground">Every design is crafted with attention to detail to capture the essence of each anime series.</p>
            </div>
            <div className="p-6 bg-background rounded-xl border">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Premium Quality</h3>
              <p className="text-sm text-muted-foreground">We use only the finest materials to ensure comfort, durability, and vibrant prints that last.</p>
            </div>
            <div className="p-6 bg-background rounded-xl border">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Community First</h3>
              <p className="text-sm text-muted-foreground">We are building a community of anime fans who share passion and support each other.</p>
            </div>
            <div className="p-6 bg-background rounded-xl border">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                <Truck className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Fast Delivery</h3>
              <p className="text-sm text-muted-foreground">Quick shipping worldwide so you can enjoy your favorite hoodie as soon as possible.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4">The Team</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Meet Our Creators</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: "Alex Chen", role: "Founder & CEO", initials: "AC" },
              { name: "Sarah Miller", role: "Head of Design", initials: "SM" },
              { name: "Mike Johnson", role: "Lead Developer", initials: "MJ" },
              { name: "Emma Wilson", role: "Community Manager", initials: "EW" }
            ].map((member) => (
              <div key={member.name} className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-1">
                  <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                    <span className="text-xl font-bold">{member.initials}</span>
                  </div>
                </div>
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-purple-600 p-8 sm:p-12 text-center text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to Join the Legend?
            </h2>
            <p className="mb-8 opacity-90 max-w-xl mx-auto">
              Discover our collection of premium anime hoodies and find the perfect 
              piece to express your fandom.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/shop">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90">
                  Shop Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
