package com.suicide.codeConnect_api.web.exception;

import com.suicide.codeConnect_api.exception.EmailUniqueViolationException;
import com.suicide.codeConnect_api.exception.PostNotFoundException;
import com.suicide.codeConnect_api.exception.UniqueViolationExcption;
import com.suicide.codeConnect_api.exception.UsuarioNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import javax.print.attribute.standard.Media;

@Slf4j
@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorMessage> methodArgumentNotValidException (MethodArgumentNotValidException  ex ,
                                                                         HttpServletRequest request,
                                                                         BindingResult result) {
        log.error("Api Error",ex);
        return ResponseEntity
                .status(HttpStatus.UNPROCESSABLE_ENTITY)
                .contentType(MediaType.APPLICATION_JSON)
                .body(new ErrorMessage(request,HttpStatus.UNPROCESSABLE_ENTITY,"Erro no preenchimento do campo",result));
    }

    @ExceptionHandler(UniqueViolationExcption.class)
    public ResponseEntity<ErrorMessage> uniqueViolationException (RuntimeException  ex ,
                                                                         HttpServletRequest request) {
        log.error("Api Error",ex);
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .contentType(MediaType.APPLICATION_JSON)
                .body(new ErrorMessage(request,HttpStatus.CONFLICT, ex.getMessage()));
    }
    @ExceptionHandler(PostNotFoundException.class)
    public ResponseEntity<ErrorMessage> postNotFoundException(PostNotFoundException ex,
                                                              HttpServletRequest request){
        log.error("API Error", ex);
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .contentType(MediaType.APPLICATION_JSON)
                .body(new ErrorMessage(request, HttpStatus.NOT_FOUND, ex.getMessage()));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorMessage> handleAuthenticationException(AuthenticationException ex, HttpServletRequest request){
        log.warn("Authentication error", ex);
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .contentType(MediaType.APPLICATION_JSON)
                .body(new ErrorMessage(request, HttpStatus.UNAUTHORIZED, "Credencias inválidas"));
    }

    @ExceptionHandler(UsuarioNotFoundException.class)
    public ResponseEntity<ErrorMessage> UsuarioNotFoundException(UsuarioNotFoundException ex, HttpServletRequest request){
        log.warn("Authentication error", ex);
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .contentType(MediaType.APPLICATION_JSON)
                .body(new ErrorMessage(request, HttpStatus.NOT_FOUND, ex.getMessage()));
    }


}
