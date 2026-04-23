package com.example.doit.controller.exception;

import com.example.doit.dto.common.ApiResponseDTO;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.NoSuchElementException;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {


    /**
     * [400 Bad Request / HttpMessageNotReadableException]
     * @RequestBody JSON 파싱 실패 (예: [1, 2, "abc"] 처럼 Long 리스트에 문자열이 들어올 때)
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponseDTO<Void>> handleJsonParsingError(HttpMessageNotReadableException e) {

        ApiResponseDTO<Void> response = ApiResponseDTO.error(
                HttpStatus.BAD_REQUEST.value(),
                "요청한 파라미터의 형식이 올바르지 않습니다.");

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * [400 Bad Request / MethodArgumentTypeMismatchException]
     * @PathVariable 타입 변환 실패 (예: 31과 같은 taskId를 받아야하는데 abc 값이 들어올 때)
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponseDTO<Void>> handleTypeMismatch(MethodArgumentTypeMismatchException e) {

        ApiResponseDTO<Void> response = ApiResponseDTO.error(
                HttpStatus.BAD_REQUEST.value(), // 400
                "요청한 파라미터의 형식이 올바르지 않습니다."
        );

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * [400 Bad Request / MethodArgumentNotValidException]
     * @Valid 어노테이션으로 인한 DTO 유효성 검사 실패
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponseDTO<Void>> handleValidationExceptions(MethodArgumentNotValidException e) {

        String errorMessage = "입력값이 유효하지 않습니다.";

        // 지정한 에러 메시지 가져오기
        if (e.getBindingResult().hasErrors() && e.getBindingResult().getFieldError() != null) {
            errorMessage = e.getBindingResult().getFieldError().getDefaultMessage();
        }

        ApiResponseDTO<Void> response = ApiResponseDTO.error(
                HttpStatus.BAD_REQUEST.value(),
                errorMessage);

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * [400 Bad Request / IllegalArgumentException]
     * 비즈니스 로직 상 잘못된 요청 (예: 마지막 관리자 강등 시도)
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponseDTO<Void>> handleIllegalArgument(IllegalArgumentException e) {

        ApiResponseDTO<Void> response = ApiResponseDTO.error(
                HttpStatus.BAD_REQUEST.value(),
                "잘못된 요청입니다." + e.getMessage());

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }


    /**
     * [403 Forbidden / AccessDeniedException]
     * @PreAuthorize 또는 Service 계층에서 'AccessDeniedException' (인가 실패)이 발생했을 때 처리
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponseDTO<Void>> handleAccessDenied(AccessDeniedException e) {

        ApiResponseDTO<Void> response = ApiResponseDTO.error(
                HttpStatus.FORBIDDEN.value(),
                e.getMessage());

        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    /**
     * [404 Not Found / NoSuchElementException]
     * DB에 존재하지 않는 값(ID)을 조회한 결과(비어있는 Optional)에
     * .get()을 호출하여 강제로 값을 꺼내려 할 때 발생합니다.
     * (예: repository.findById(999L).get() 코드가 실행되었으나 999번 ID가 없는 경우)
     * (주로 findById 등으로 리소스를 찾지 못했을 때 발생)
     */
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ApiResponseDTO<Void>> handleNoSuchElement(NoSuchElementException e) {

        ApiResponseDTO<Void> response = ApiResponseDTO.error(
                HttpStatus.NOT_FOUND.value(),
                "리소스를 찾을 수 없습니다.");

        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    /**
     * [404 Not Found / ntityNotFoundException]
     * findById().orElseThrow()에서 발생 (예: taskId나 labelIdList의 ID가 DB에 존재하지 않을 때)
     */
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiResponseDTO<Void>> handleEntityNotFound(EntityNotFoundException e) {

        ApiResponseDTO<Void> response = ApiResponseDTO.error(
                HttpStatus.NOT_FOUND.value(),
                "리소스를 찾을 수 없습니다.");

        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    /**
     * [409 Conflict]
     * DB 무결성 제약 조건 위반 (예: 중복 저장, 없는 외래키 삽입 등)
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponseDTO<Void>> handleDataIntegrityViolation(DataIntegrityViolationException e) {

        ApiResponseDTO<Void> response = ApiResponseDTO.error(
                HttpStatus.CONFLICT.value(),
                e.getMessage());

        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    /**
     * [500 Internal Server Error]
     * 위에서 잡지 못한 모든 나머지 예외
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponseDTO<Void>> handleGlobalException(Exception e) {

        ApiResponseDTO<Void> response = ApiResponseDTO.error(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "서버 내부 오류가 발생했습니다.");

        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
