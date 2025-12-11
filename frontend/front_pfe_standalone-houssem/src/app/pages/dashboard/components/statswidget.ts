import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"

@Component({
  standalone: true,
  selector: "app-stats-widget",
  imports: [CommonModule],
  template: `<div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-gray-600 font-semibold mb-4 text-sm uppercase tracking-wide">Orders</span>
                        <div class="text-gray-900 dark:text-white font-bold text-3xl">152</div>
                    </div>
                    <!-- Enhanced icon container with better contrast -->
                    <div class="flex items-center justify-center bg-blue-500 rounded-xl shadow-lg" style="width: 3.5rem; height: 3.5rem">
                        <i class="pi pi-shopping-cart text-white text-2xl"></i>
                    </div>
                </div>
                <span class="text-blue-600 font-semibold text-sm">24 new </span>
                <span class="text-gray-500 text-sm">since last visit</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-gray-600 font-semibold mb-4 text-sm uppercase tracking-wide">Revenue</span>
                        <div class="text-gray-900 dark:text-white font-bold text-3xl">$2.100</div>
                    </div>
                    <!-- Enhanced icon container with better contrast -->
                    <div class="flex items-center justify-center bg-emerald-500 rounded-xl shadow-lg" style="width: 3.5rem; height: 3.5rem">
                        <i class="pi pi-dollar text-white text-2xl"></i>
                    </div>
                </div>
                <span class="text-emerald-600 font-semibold text-sm">%52+ </span>
                <span class="text-gray-500 text-sm">since last week</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-gray-600 font-semibold mb-4 text-sm uppercase tracking-wide">Customers</span>
                        <div class="text-gray-900 dark:text-white font-bold text-3xl">28441</div>
                    </div>
                    <!-- Enhanced icon container with better contrast -->
                    <div class="flex items-center justify-center bg-purple-500 rounded-xl shadow-lg" style="width: 3.5rem; height: 3.5rem">
                        <i class="pi pi-users text-white text-2xl"></i>
                    </div>
                </div>
                <span class="text-purple-600 font-semibold text-sm">520 </span>
                <span class="text-gray-500 text-sm">newly registered</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-gray-600 font-semibold mb-4 text-sm uppercase tracking-wide">Comments</span>
                        <div class="text-gray-900 dark:text-white font-bold text-3xl">152 Unread</div>
                    </div>
                    <!-- Enhanced icon container with better contrast -->
                    <div class="flex items-center justify-center bg-orange-500 rounded-xl shadow-lg" style="width: 3.5rem; height: 3.5rem">
                        <i class="pi pi-comment text-white text-2xl"></i>
                    </div>
                </div>
                <span class="text-orange-600 font-semibold text-sm">85 </span>
                <span class="text-gray-500 text-sm">responded</span>
            </div>
        </div>`,
})
export class StatsWidget {}
