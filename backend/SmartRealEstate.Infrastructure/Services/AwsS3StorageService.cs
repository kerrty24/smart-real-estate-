using Amazon;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using SmartRealEstate.Core.Interfaces;
using System;
using System.IO;
using System.Threading.Tasks;

namespace SmartRealEstate.Infrastructure.Services
{
    public class AwsS3StorageService : IImageStorageService
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly bool _useLocalFallback;
        private readonly string _localUploadsPath;
        
        public AwsS3StorageService(IConfiguration configuration, IHttpContextAccessor httpContextAccessor)
        {
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;

            var accessKey = _configuration["AwsSettings:AccessKey"];
            var secretKey = _configuration["AwsSettings:SecretKey"];

            _useLocalFallback = string.IsNullOrEmpty(accessKey) || 
                                accessKey == "YOUR_AWS_ACCESS_KEY_ID" || 
                                string.IsNullOrEmpty(secretKey) || 
                                secretKey == "YOUR_AWS_SECRET_ACCESS_KEY";

            // Local upload path: wwwroot/uploads
            _localUploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (_useLocalFallback && !Directory.Exists(_localUploadsPath))
            {
                Directory.CreateDirectory(_localUploadsPath);
            }
        }

        public async Task<string> UploadImageAsync(Stream fileStream, string fileName, string contentType)
        {
            var uniqueFileName = $"{Guid.NewGuid()}_{fileName}";

            if (_useLocalFallback)
            {
                var filePath = Path.Combine(_localUploadsPath, uniqueFileName);
                using (var localStream = new FileStream(filePath, FileMode.Create))
                {
                    await fileStream.CopyToAsync(localStream);
                }

                // Construct absolute URL for local file
                var request = _httpContextAccessor.HttpContext?.Request;
                var baseUrl = request != null ? $"{request.Scheme}://{request.Host}" : "http://localhost:5000";
                return $"{baseUrl}/uploads/{uniqueFileName}";
            }
            else
            {
                var bucketName = _configuration["AwsSettings:BucketName"];
                var regionString = _configuration["AwsSettings:Region"] ?? "us-east-1";
                var accessKey = _configuration["AwsSettings:AccessKey"]!;
                var secretKey = _configuration["AwsSettings:SecretKey"]!;

                var region = RegionEndpoint.GetBySystemName(regionString);
                using var client = new AmazonS3Client(accessKey, secretKey, region);

                var putRequest = new PutObjectRequest
                {
                    BucketName = bucketName,
                    Key = uniqueFileName,
                    InputStream = fileStream,
                    ContentType = contentType
                };

                await client.PutObjectAsync(putRequest);

                return $"https://{bucketName}.s3.{regionString}.amazonaws.com/{uniqueFileName}";
            }
        }

        public Task DeleteImageAsync(string imageUrl)
        {
            if (string.IsNullOrEmpty(imageUrl)) return Task.CompletedTask;

            try
            {
                if (_useLocalFallback)
                {
                    var uri = new Uri(imageUrl);
                    var fileName = Path.GetFileName(uri.LocalPath);
                    var filePath = Path.Combine(_localUploadsPath, fileName);
                    if (File.Exists(filePath))
                    {
                        File.Delete(filePath);
                    }
                }
                else
                {
                    var bucketName = _configuration["AwsSettings:BucketName"];
                    var regionString = _configuration["AwsSettings:Region"] ?? "us-east-1";
                    var accessKey = _configuration["AwsSettings:AccessKey"]!;
                    var secretKey = _configuration["AwsSettings:SecretKey"]!;

                    var uri = new Uri(imageUrl);
                    var key = uri.LocalPath.TrimStart('/');

                    var region = RegionEndpoint.GetBySystemName(regionString);
                    using var client = new AmazonS3Client(accessKey, secretKey, region);

                    _ = client.DeleteObjectAsync(bucketName, key);
                }
            }
            catch
            {
                // Suppress exceptions on deletes to prevent crash if file is missing
            }

            return Task.CompletedTask;
        }
    }
}
