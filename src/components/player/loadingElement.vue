<template>
    <div class="loading-component">
      <div class="spinner" v-if="isLoading">
        <!-- You can customize the loading spinner here -->
        <div class="spinner-icon"></div>
      </div>
      <div v-else>
        <!-- Content to display when not loading -->
        <slot></slot>
      </div>
    </div>
  </template>
    
  <script setup lang="ts">
  import { defineProps } from 'vue';
  
  
  defineProps({
    isLoading: Boolean,
  });
  
  </script>
    
  <style scoped>
  .loading-component {
    position: relative;
    min-height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
  }
  
  .spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  .spinner-icon {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #FE6702;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 2s linear infinite;
  }
  
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
  
    100% {
      transform: rotate(360deg);
    }
  }</style>
    