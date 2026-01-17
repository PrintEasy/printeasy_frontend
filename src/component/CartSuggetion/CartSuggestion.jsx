"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./cartsuggestion.module.scss";
import ProductCard from "@/component/ProductCard/ProductCard";
import ProductCardShimmer from "@/component/ProductShimmer/ProductShimmer";
import axios from "axios";
import api from "@/axiosInstance/axiosInstance";

const CartSuggestion = () => {
  const [filter, setFilter] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(
    "KjYkkJYBXXwIBXnpIgCg"
  );

  const [page, setPage] = useState(1);
  const limit = 10;
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  /* ---------------- FETCH FILTERS ---------------- */
  const getFilters = async () => {
    try {
      const res = await axios.get(`${apiUrl}/v1/categories/all`, {
        headers: {
          "x-api-key":
            "454ccaf106998a71760f6729e7f9edaf1df17055b297b3008ff8b65a5efd7c10",
        },
      });

      setFilter(res?.data?.data?.[0]?.collections || []);
    } catch (err) {
      console.error("Error fetching filters:", err);
    }
  };

  /* ---------------- FETCH PRODUCTS ---------------- */
  const fetchProducts = async (categoryId, pageNumber = 1) => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);

      const res = await api.get(`/v2/product/collections`, {
        params: {
          categoryId: "H8SZ4VfsFXa4C9cUeonB",
          identifier: categoryId,
          page: pageNumber,
          limit,
        },
        headers: {
          "x-api-key":
            "454ccaf106998a71760f6729e7f9edaf1df17055b297b3008ff8b65a5efd7c10",
        },
      });

      const newData = res?.data?.data || [];

      setProducts((prev) =>
        pageNumber === 1 ? newData : [...prev, ...newData]
      );

      if (newData.length < limit) setHasMore(false);

      setPage(pageNumber);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- CATEGORY CHANGE ---------------- */
  const handleCategoryChange = (id) => {
    setSelectedCategory(id);
    setProducts([]);
    setPage(1);
    setHasMore(true);
    fetchProducts(id, 1);

    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
  };

  /* ---------------- HORIZONTAL PAGINATION ---------------- */
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 50) {
      fetchProducts(selectedCategory, page + 1);
    }
  };

  /* ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
    getFilters();
    fetchProducts(selectedCategory, 1);
  }, []);

  return (
    <div className={styles.cartSugges_main_wrap}>
      <h3 className={styles.heading}>You may also like</h3>

      {/* FILTER BUTTONS */}
      <div className={styles.filters}>
        {filter?.map((cat) => (
          <button
            key={cat.id}
            className={`${styles.filterBtn} ${
              selectedCategory === cat.id ? styles.active : ""
            }`}
            onClick={() => handleCategoryChange(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* HORIZONTAL PRODUCTS */}
      <div
        className={styles.horizontalScroll}
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {products.map((item) => (
          <div key={item.id} className={styles.cardWrapper}>
            <ProductCard item={item} />
          </div>
        ))}

        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.cardWrapper}>
              <ProductCardShimmer />
            </div>
          ))}
      </div>

    </div>
  );
};

export default CartSuggestion;
