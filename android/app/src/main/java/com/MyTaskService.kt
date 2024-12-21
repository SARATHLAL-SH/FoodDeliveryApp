package com.fooddeliveryapp

import android.content.Intent
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig
import com.facebook.react.jstasks.HeadlessJsTaskRetryPolicy // Import this
import com.facebook.react.jstasks.LinearCountingRetryPolicy // Import this if you plan to use it, or use default retry policy

class MyTaskService : HeadlessJsTaskService() {
    override fun getTaskConfig(intent: Intent): HeadlessJsTaskConfig? {
        val extras = intent.extras
        if (extras != null) {
            // Define the retry policy (3 retries, 1 second between each retry)
            val retryPolicy: HeadlessJsTaskRetryPolicy = LinearCountingRetryPolicy(
                3, // Max number of retry attempts
                1000 // Delay between each retry attempt in milliseconds
            )
            
            // You can configure your task with retries
            return HeadlessJsTaskConfig(
                "SomeTaskName", // Task name should match JS
                Arguments.fromBundle(extras), // Pass the data to the task
                5000, // Timeout for the task (5 seconds)
                false, // Set false to run in the background
                retryPolicy // Retry policy
            )
        }
        return null
    }
}
