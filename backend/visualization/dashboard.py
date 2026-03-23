# backend/visualization/dashboard.py
import matplotlib.pyplot as plt
import io
import base64
import pandas as pd
import numpy as np
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import seaborn as sns
from fastapi import HTTPException

class NutritionVisualizer:
    
    @staticmethod
    def create_macro_trend_chart(dates: List[str], protein: List[float], 
                                  carbs: List[float], fats: List[float]):
        """Create macro nutrient trend over time"""
        fig, ax = plt.subplots(figsize=(12, 6))
        
        ax.plot(dates, protein, marker='o', label='Protein (g)', linewidth=2)
        ax.plot(dates, carbs, marker='s', label='Carbs (g)', linewidth=2)
        ax.plot(dates, fats, marker='^', label='Fats (g)', linewidth=2)
        
        ax.set_xlabel('Date')
        ax.set_ylabel('Grams')
        ax.set_title('Macronutrient Intake Over Time')
        ax.legend()
        ax.grid(True, alpha=0.3)
        plt.xticks(rotation=45)
        plt.tight_layout()
        
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', bbox_inches='tight')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        plt.close()
        
        return image_base64
    
    @staticmethod
    def create_bmi_chart(heights: List[float], weights: List[float], dates: List[str]):
        """Create BMI trend chart"""
        bmi_values = [w / ((h/100) ** 2) for w, h in zip(weights, heights)]
        
        fig, ax = plt.subplots(figsize=(10, 6))
        
        # BMI categories
        ax.axhspan(0, 18.5, alpha=0.2, color='blue', label='Underweight')
        ax.axhspan(18.5, 25, alpha=0.2, color='green', label='Normal')
        ax.axhspan(25, 30, alpha=0.2, color='yellow', label='Overweight')
        ax.axhspan(30, 40, alpha=0.2, color='red', label='Obese')
        
        ax.plot(dates, bmi_values, marker='o', linewidth=2, color='purple', label='Your BMI')
        
        ax.set_xlabel('Date')
        ax.set_ylabel('BMI')
        ax.set_title('BMI Progress Over Time')
        ax.legend(loc='upper right')
        ax.grid(True, alpha=0.3)
        plt.xticks(rotation=45)
        plt.tight_layout()
        
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', bbox_inches='tight')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        plt.close()
        
        return image_base64
    
    @staticmethod
    def create_calorie_heatmap(calorie_data: List[Dict]):
        """Create calorie intake heatmap"""
        # Convert to DataFrame
        df = pd.DataFrame(calorie_data)
        df['date'] = pd.to_datetime(df['date'])
        df['day'] = df['date'].dt.day_name()
        df['week'] = df['date'].dt.isocalendar().week
        
        # Pivot for heatmap
        pivot = df.pivot_table(values='calories', index='day', columns='week', aggfunc='mean')
        
        fig, ax = plt.subplots(figsize=(12, 8))
        im = ax.imshow(pivot.values, cmap='YlOrRd', aspect='auto')
        
        ax.set_xticks(range(len(pivot.columns)))
        ax.set_xticklabels(pivot.columns)
        ax.set_yticks(range(len(pivot.index)))
        ax.set_yticklabels(pivot.index)
        
        plt.colorbar(im, ax=ax, label='Calories')
        ax.set_xlabel('Week Number')
        ax.set_ylabel('Day of Week')
        ax.set_title('Calorie Intake Heatmap')
        
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', bbox_inches='tight')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        plt.close()
        
        return image_base64
    
    @staticmethod
    def create_water_intake_chart(dates: List[str], water_ml: List[float], target_ml: float = 2000):
        """Create water intake tracking chart"""
        fig, ax = plt.subplots(figsize=(12, 6))
        
        bars = ax.bar(dates, water_ml, color=['#2ecc71' if w >= target_ml else '#e74c3c' for w in water_ml])
        ax.axhline(y=target_ml, color='#3498db', linestyle='--', linewidth=2, label=f'Target: {target_ml}ml')
        
        ax.set_xlabel('Date')
        ax.set_ylabel('Water Intake (ml)')
        ax.set_title('Daily Water Intake')
        ax.legend()
        
        # Add value labels
        for bar, val in zip(bars, water_ml):
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height,
                   f'{int(val)}ml', ha='center', va='bottom')
        
        plt.xticks(rotation=45)
        plt.tight_layout()
        
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', bbox_inches='tight')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        plt.close()
        
        return image_base64
    
    @staticmethod
    def create_meal_distribution_chart(meals: Dict[str, float]):
        """Create meal distribution pie chart"""
        fig, ax = plt.subplots(figsize=(8, 8))
        
        colors = ['#ff9999', '#66b3ff', '#99ff99', '#ffcc99', '#ff99cc']
        
        wedges, texts, autotexts = ax.pie(meals.values(), 
                                           labels=meals.keys(),
                                           colors=colors,
                                           autopct='%1.1f%%',
                                           startangle=90)
        
        ax.set_title('Meal Distribution')
        
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', bbox_inches='tight')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        plt.close()
        
        return image_base64