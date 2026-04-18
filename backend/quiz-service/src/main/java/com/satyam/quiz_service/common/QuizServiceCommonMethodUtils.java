package com.satyam.quiz_service.common;

import org.springframework.stereotype.Component;

import java.util.concurrent.atomic.AtomicLong;

@Component
public class QuizServiceCommonMethodUtils {
    private  final AtomicLong counter = new AtomicLong(0);

    public  synchronized Long generateId() {
        long time = System.currentTimeMillis();
        long count = counter.incrementAndGet() % 1000;
        return time * 1000 + count;
    }
}
