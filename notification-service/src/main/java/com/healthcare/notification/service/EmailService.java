package com.healthcare.notification.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@Slf4j
public class EmailService {

	@Autowired
	private JavaMailSender javaMailSender;

	public void sendSimpleEmail(String to, String subject, String text) {
		try {
			log.info("Sending simple email to: {}", to);
			SimpleMailMessage message = new SimpleMailMessage();
			message.setTo(to);
			message.setSubject(subject);
			message.setText(text);
			javaMailSender.send(message);
			log.info("Email sent successfully to: {}", to);
		} catch (Exception e) {
			log.error("Failed to send simple email to: {}", to, e);
			throw new RuntimeException("Failed to send email", e);
		}
	}

	public void sendHtmlEmail(String to, String subject, String htmlContent) {
		try {
			log.info("Sending HTML email to: {}", to);
			MimeMessage message = javaMailSender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(message, true);
			helper.setTo(to);
			helper.setSubject(subject);
			helper.setText(htmlContent, true);
			javaMailSender.send(message);
			log.info("HTML email sent successfully to: {}", to);
		} catch (MessagingException e) {
			log.error("Failed to send HTML email to: {}", to, e);
			throw new RuntimeException("Failed to send email", e);
		}
	}

}
