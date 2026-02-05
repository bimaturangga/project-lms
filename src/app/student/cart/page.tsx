"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sidebar, TopHeader } from "@/components/layout";
import { useCartStore } from "@/stores/cartStore";
import styles from "./cart.module.css";
import { Trash2, ShoppingCart } from "lucide-react";

export default function CartPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const { items, removeFromCart, getTotalPrice } = useCartStore();

  const total = getTotalPrice();
  const formattedTotal = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(total);

  const handleRemove = (courseId: string) => {
    removeFromCart(courseId as any);
  };

  const handleCheckout = () => {
    router.push("/student/payment/cart-checkout");
  };

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className={styles.main}>
        <TopHeader
          title="Keranjang Belanja"
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className={styles.content}>
          <h1 className={styles.title}>Keranjang Saya ({items.length})</h1>

          {items.length > 0 ? (
            <div className={styles.cartGrid}>
              <div className={styles.cartList}>
                {items.map((item) => (
                  <div key={item._id} className={styles.cartItem}>
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className={styles.itemImage}
                    />
                    <div className={styles.itemInfo}>
                      <Link
                        href={`/student/explore/${item._id}`}
                        className={styles.itemTitle}
                      >
                        {item.title}
                      </Link>
                      <p className={styles.itemInstructor}>
                        Oleh {item.instructor}
                      </p>
                    </div>
                    <div className={styles.itemPrice}>
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(item.price)}
                    </div>
                    <button
                      className={styles.removeBtn}
                      onClick={() => handleRemove(item._id)}
                      title="Hapus"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>

              <div className={styles.summaryCard}>
                <h3 className={styles.summaryTitle}>Ringkasan Belanja</h3>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>{formattedTotal}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Diskon</span>
                  <span>Rp 0</span>
                </div>
                <div className={styles.summaryTotal}>
                  <span>Total</span>
                  <span>{formattedTotal}</span>
                </div>
                <button className={styles.checkoutBtn} onClick={handleCheckout}>
                  Checkout
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <ShoppingCart
                size={64}
                style={{ marginBottom: "16px", opacity: 0.2 }}
              />
              <h2>Keranjang Anda kosong</h2>
              <p style={{ margin: "16px 0 24px" }}>
                Temukan kursus terbaik untuk meningkatkan skill Anda.
              </p>
              <Link
                href="/student/explore"
                style={{
                  display: "inline-block",
                  padding: "12px 24px",
                  backgroundColor: "var(--primary)",
                  color: "white",
                  borderRadius: "var(--radius-full)",
                  fontWeight: 600,
                }}
              >
                Jelajahi Kursus
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
