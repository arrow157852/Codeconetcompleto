package com.suicide.codeConnect_api.web.controller;


import com.suicide.codeConnect_api.entity.Posts;
import com.suicide.codeConnect_api.service.PostsService;
import com.suicide.codeConnect_api.web.dto.*;
import com.suicide.codeConnect_api.web.dto.mapper.PosteMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/Posts")
public class PostsController {

    private final PostsService postsService;

    @PostMapping
    public ResponseEntity<PostsResponseDTO> create(@Valid @RequestBody PostsDto createDto){
        var post = postsService.criarPost(createDto);
        return ResponseEntity.ok(PosteMapper.toDto(post));
    }

    @GetMapping
    public ResponseEntity<List<PostsResponseDTO>> getAllPosts(){
        List<Posts> posts = postsService.getAllPosts();
        return ResponseEntity.ok(PosteMapper.toListDto(posts));
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<PostsResponseDTO>> getPostsByUsuario(@PathVariable Long usuarioId){
        List<Posts> posts = postsService.getPostsByUsuarioId(usuarioId);
        return ResponseEntity.ok(PosteMapper.toListDto(posts));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostsResponseDTO> getById(@PathVariable Long id){
        Posts post = postsService.buscarPorId(id);
        return ResponseEntity.ok(PosteMapper.toDto(post));
    }

    @GetMapping("/titulo")
    public ResponseEntity<List<PostsResponseDTO>> getTitle(@RequestParam String title){
        List<Posts> posts = postsService.buscarPorTitle(title);
        List<PostsResponseDTO> dtoList = posts.stream()
                .map(PosteMapper::toDto)
                .toList();
        return ResponseEntity.ok(dtoList);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        postsService.deletarPost(id);
        return ResponseEntity.noContent().build();
    }

}
